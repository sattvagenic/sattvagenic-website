import { useEffect, useRef } from 'react';

/*
 * NadiCurrents — faint phosphorescent currents rising through the margins of a page,
 * like prana moving up the nadis. Each current is redrawn as it drifts while the canvas
 * slowly fades, so it leaves a translucent trail behind it. The content column stays
 * clear. Desktop only, 30 frames a second at half resolution, paused when the tab is
 * hidden, and a single still frame for anyone who prefers reduced motion.
 */
const INKS = [[143, 214, 184], [156, 146, 232], [236, 107, 64], [201, 154, 62], [120, 200, 220]];
const SCALE = 0.5;          // draw at half resolution: softer, and cheaper
const CLEAR = 900;          // width of the content column to keep clear, in CSS pixels

export default function NadiCurrents() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const wide = window.matchMedia('(min-width: 1100px)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!canvas || !wide.matches) return undefined;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, raf = 0, last = 0;
    const start = performance.now();
    const currents = Array.from({ length: 10 }, (_, i) => ({
      side: i % 2 ? 1 : -1, lane: 0.15 + 0.7 * ((i * 0.618) % 1), speed: 0.5 + ((i * 0.37) % 1) * 0.9,
      sway: 26 + ((i * 0.53) % 1) * 64, curl: 0.7 + ((i * 0.29) % 1) * 1.4, ink: INKS[i % INKS.length],
      width: 0.7 + ((i * 0.41) % 1) * 1.1, phase: i * 1.7,
    }));
    const resize = () => {
      w = canvas.width = Math.round(window.innerWidth * SCALE);
      h = canvas.height = Math.round(window.innerHeight * SCALE);
    };
    const draw = now => {
      const t = (now - start) / 1000;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const margin = Math.max(0, (w - CLEAR * SCALE) / 2);
      for (const c of currents) {
        const x0 = c.side < 0 ? margin * c.lane : w - margin * c.lane;
        ctx.beginPath();
        for (let k = 0; k <= 48; k++) {
          const y = h * (1.04 - k / 46);
          const x = x0 + Math.sin(k * 0.16 * c.curl + t * 0.22 * c.speed + c.phase) * c.sway * SCALE
                       + Math.sin(k * 0.045 + t * 0.06 + c.phase) * c.sway * 0.7 * SCALE * c.side;
          if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        const [r, g, b] = c.ink;
        const grad = ctx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.45, `rgba(${r},${g},${b},0.075)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = c.width;
        ctx.shadowColor = `rgba(${r},${g},${b},0.45)`;
        ctx.shadowBlur = 6;
        ctx.stroke();
      }
    };
    const loop = now => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;
      last = now;
      draw(now);
    };
    resize();
    if (still.matches) { for (let i = 0; i < 40; i++) draw(start + i * 400); }
    else raf = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} className="nadi-currents" aria-hidden="true" />;
}
