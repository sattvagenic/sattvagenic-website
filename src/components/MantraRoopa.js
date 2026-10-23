import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { findMantra } from './mantras';
import patina from '../images/home/patina.jpg';
import './MantraRoopa.css';

/*
 * Mantra Roopa: a mantra grown into a living form (WebGL).
 * The engine is a plain ES module in public/mantra-roopa-engine/ (with its own copy of three.js beside it),
 * loaded only when this page opens, so the rest of the site never downloads it.
 */
const ENGINE_URL = '/mantra-roopa-engine/engine.js';

export default function MantraRoopa() {
  const { slug } = useParams();
  const mantra = findMantra(slug);
  const stageRef = useRef(null);
  const apiRef = useRef(null);
  const want = useRef({ user: true, onScreen: true, tabVisible: true });
  const [status, setStatus] = useState('loading');   // loading | ready | error
  const [playing, setPlaying] = useState(true);

  // run only when the visitor wants it, it's on screen, and the tab is visible
  const sync = useCallback(() => {
    const api = apiRef.current, w = want.current;
    if (!api) return;
    if (w.user && w.onScreen && w.tabVisible) api.start(); else api.stop();
  }, []);

  useEffect(() => {
    if (!mantra) return undefined;
    let cancelled = false;
    const prevTitle = document.title;
    document.title = `${mantra.name} · Mantra Roopa · Sattvagenic`;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    want.current.user = !still;
    setPlaying(!still);

    (async () => {
      try {
        // the syllables are drawn into a texture once, so the fonts must be in first
        await Promise.race([
          Promise.all([
            document.fonts.load('100px "Tiro Devanagari Sanskrit"', mantra.deva),
            document.fonts.load('12px "Share Tech Mono"'),
            document.fonts.load('italic 300 19px Spectral'),
          ]),
          new Promise(r => setTimeout(r, 4000)),
        ]);
        const url = ENGINE_URL;
        const { mount } = await import(/* webpackIgnore: true */ url);
        if (cancelled || !stageRef.current) return;
        apiRef.current = mount(stageRef.current, { mantra, patina, manual: true });
        if (still) apiRef.current.renderAt(9);
        setStatus('ready');
        sync();
      } catch (err) {
        console.error('Mantra Roopa could not start:', err);
        if (!cancelled) setStatus('error');
      }
    })();

    const io = new IntersectionObserver(([entry]) => { want.current.onScreen = entry.isIntersecting; sync(); }, { threshold: 0.05 });
    if (stageRef.current) io.observe(stageRef.current);
    const onVis = () => { want.current.tabVisible = !document.hidden; sync(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      apiRef.current?.dispose();
      apiRef.current = null;
      document.title = prevTitle;
    };
  }, [mantra, sync]);

  if (!mantra) return <Navigate to="/mantra-roopa" replace />;

  const toggle = () => {
    want.current.user = !want.current.user;
    setPlaying(want.current.user);
    sync();
  };

  return (
    <main className="mroopa">
      <h1 className="mroopa-visually-hidden">{mantra.name} mantra roopa</h1>
      <div className="mroopa-stage" ref={stageRef}
           role="img" aria-label={`The ${mantra.name} mantra as a living form: its syllables ride 54 lines of light round a glowing Om, inside a breathing golden torus.`}>
        {status === 'loading' && <div className="mroopa-loading">INSTALLING MANTRA</div>}
        {status === 'error' && (
          <div className="mroopa-error">
            This piece needs WebGL, which this browser hasn't allowed. Try a recent Chrome, Safari or Firefox.
          </div>
        )}
        {status === 'ready' && (
          <button type="button" className="mroopa-toggle" onClick={toggle} aria-pressed={!playing}>
            {playing ? 'PAUSE' : 'PLAY'}
          </button>
        )}
      </div>
      {mantra.notes && (
        <div className="mroopa-notes">
          {mantra.notes.map((n, i) => <p key={i}>{n}</p>)}
        </div>
      )}
    </main>
  );
}
