import React from 'react';

/*
 * HeaderOrnament — glyphs either side of the logo on the inner pages (the homepage has
 * its own margins). Circuit traces with round terminals run out from the logo to a star
 * sighting, a small yantra over a patch of halftone, and a rust tag carrying the page's
 * word in Sanskrit. Worn at the edges like a print. Desktop only; decorative.
 */
const WORDS = {
  '/music': ['नाद', 'nāda · sound'],
  '/about': ['सत्त्व', 'sattva · clarity'],
  '/metta-morph': ['मैत्री', 'maitrī · kindness'],
};
const star = 'M0,-15 L2.8,-2.8 L15,0 L2.8,2.8 L0,15 L-2.8,2.8 L-15,0 L-2.8,-2.8 Z';

function Side({ side, word }) {
  // Drawn for the left side; the right side mirrors the line work but keeps its text readable.
  const m = side === 'right', X = x => (m ? 340 - x : x), anchor = m ? 'end' : 'start';
  return (
    <svg className={`hd-orn hd-orn-${side}`} viewBox="0 0 340 236" aria-hidden="true">
      <defs>
        <pattern id={`hdDots-${side}`} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1.2" fill="#4fa58a" />
        </pattern>
        <radialGradient id={`hdFade-${side}`}><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <mask id={`hdMask-${side}`}><circle cx={X(70)} cy="74" r="58" fill={`url(#hdFade-${side})`} /></mask>
      </defs>
      <g filter="url(#hdWorn)">
        {/* the outer corner */}
        <path className="hd-bone" d={`M${X(6)} 40 V${6} H${X(40)}`} />
        <text className="hd-mono" x={X(14)} y="22" textAnchor={anchor}>{m ? 'CH · FLOW' : 'SV · 07'}</text>

        {/* halftone under a small yantra */}
        <rect x={X(70) - 58} y="16" width="116" height="116" fill={`url(#hdDots-${side})`} mask={`url(#hdMask-${side})`} opacity="0.55" />
        <g transform={`translate(${X(70)} 74)`}>
          <circle className="hd-jade" r="38" /><circle className="hd-soft" r="30" />
          <polygon className="hd-bone" points="0,-26 22.5,13 -22.5,13" />
          <polygon className="hd-verm" points="0,26 22.5,-13 -22.5,-13" />
          <circle className="hd-dot-verm" r="2.6" />
        </g>

        {/* the trace from the logo out to the sighting, with nodes and a round terminal */}
        <polyline className="hd-jade" points={`${X(334)},118 ${X(196)},118 ${X(176)},138 ${X(118)},138`} />
        <circle className="hd-node" cx={X(290)} cy="118" r="2.4" /><circle className="hd-node" cx={X(236)} cy="118" r="2.4" />
        <polyline className="hd-soft" points={`${X(70)},112 ${X(70)},170 ${X(40)},200`} /><circle className="hd-term" cx={X(38)} cy="202" r="3.4" />

        <g transform={`translate(${X(96)} 138)`}>
          <circle className="hd-verm" r="22" /><path className="hd-star" d={star} />
          <line className="hd-verm" x1="-30" y1="0" x2="-24" y2="0" /><line className="hd-verm" x1="24" y1="0" x2="30" y2="0" />
        </g>

        {/* the page's word, on a rust tag */}
        <rect className="hd-tag" x={m ? 340 - 148 - 136 : 148} y="160" width="136" height="30" rx="8" />
        <text className="hd-tag-deva" x={m ? 340 - 148 - 16 : 164} y="181" textAnchor={anchor} lang="sa">{word[0]}</text>
        <text className="hd-tag-dots" x={m ? 340 - 148 - 120 : 268} y="179" textAnchor={m ? 'start' : 'end'}>✦ ·</text>
        <text className="hd-mono" x={m ? 340 - 148 : 148} y="208" textAnchor={anchor}>{word[1]}</text>
        <text className="hd-mono hd-faint" x={X(196)} y="104" textAnchor={anchor}>{m ? '१०८ · ∞' : '72 000'}</text>
      </g>
    </svg>
  );
}

export default function HeaderOrnament({ path }) {
  const word = WORDS[path];
  if (!word) return null;
  return (
    <div className="hd-ornament" aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }} focusable="false">
        <filter id="hdWorn" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.7" numOctaves="2" seed="6" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <Side side="left" word={word} />
      <Side side="right" word={word} />
    </div>
  );
}
