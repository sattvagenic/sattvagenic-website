import React from 'react';
import figureMask from '../images/home/figure-mask.png';
import heartWindow from '../images/home/heart-window.jpg';

/*
 * HeroPlate: plate 01 of the homepage. The seated figure from the Nadi painting,
 * printed as worn bone-white ink with a vermilion misregistration, then measured
 * and annotated like a field study: drafting lines, chakra nodes, callouts, and a
 * cut-out window at the heart showing a fragment of the original painting.
 *
 * Coordinates are in a 1200 × 1100 plate; the figure sits at (67, 56), 1066 × 988.
 * Purely decorative: aria-hidden, no pointer events.
 */
const CX = 598;                       // the sushumna, the figure's centre line
const NODES = [                       // chakra heights, from the base up
  { y: 846, n: '01' }, { y: 706, n: '02' }, { y: 616, n: '03' },
  { y: 476, n: '04' }, { y: 341, n: '05' }, { y: 228, n: '06' }, { y: 132, n: '07' },
];
const star = (R, r) => `M0,${-R} L${r},${-r} L${R},0 L${r},${r} L0,${R} L${-r},${r} L${-R},0 L${-r},${-r} Z`;

function Callout({ x, y, tx, ty, text, side = 'right' }) {
  // A leader from a point on the figure to a rounded tag, as in an annotated specimen.
  const w = text.length * 12 + 40;    // the mono face is about 12 units a character here
  const bx = side === 'right' ? tx : tx - w, mid = side === 'right' ? tx - 34 : tx + 34;
  return (
    <g className="hp-callout">
      <circle className="hp-c-dot" cx={x} cy={y} r="5" />
      <polyline className="hp-c-lead" points={`${x},${y} ${mid},${ty} ${tx},${ty}`} />
      <rect className="hp-c-box" x={bx} y={ty - 22} width={w} height="44" rx="11" />
      <text className="hp-c-text" x={bx + 20} y={ty + 7}>{text}</text>
    </g>
  );
}

function Dim({ x1, y1, x2, y2, label, vertical = false }) {
  // A drafting dimension: a line with end ticks and a small label at its middle.
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <g className="hp-dim">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {vertical
        ? <><line x1={x1 - 9} y1={y1} x2={x1 + 9} y2={y1} /><line x1={x2 - 9} y1={y2} x2={x2 + 9} y2={y2} /></>
        : <><line x1={x1} y1={y1 - 9} x2={x1} y2={y1 + 9} /><line x1={x2} y1={y2 - 9} x2={x2} y2={y2 + 9} /></>}
      <text x={vertical ? mx - 14 : mx} y={vertical ? my : my - 12} textAnchor="middle"
        transform={vertical ? `rotate(-90 ${mx - 14} ${my})` : undefined}>{label}</text>
    </g>
  );
}

export default function HeroPlate() {
  const mask = { WebkitMaskImage: `url(${figureMask})`, maskImage: `url(${figureMask})` };
  return (
    <figure className="hp-plate" aria-hidden="true">
      <div className="hp-plate-inner">
        {/* the figure: a vermilion pass slightly off register, then the bone-white print */}
        <div className="hp-fig hp-fig-riso" style={mask} />
        <div className="hp-fig hp-fig-ink" style={mask} />
        {/* the window at the heart: a fragment of the original painting */}
        <div className="hp-window"><img src={heartWindow} alt="" /></div>

        <svg className="hp-overlay" viewBox="0 0 1200 1100" preserveAspectRatio="xMidYMid meet">
          {/* drafting: the measured body */}
          <g className="hp-draft">
            <rect x="236" y="150" width="728" height="781" />
            <rect x="521" y="150" width="157" height="160" />
            <rect x="368" y="390" width="463" height="320" />
            <rect x="392" y="430" width="240" height="98" className="hp-draft-soft" />
            <line x1="190" y1="228" x2="1010" y2="228" className="hp-draft-soft" />
            <line x1="190" y1="476" x2="1010" y2="476" className="hp-draft-soft" />
            <line x1="190" y1="846" x2="1010" y2="846" className="hp-draft-soft" />
          </g>
          <line className="hp-sushumna" x1={CX} y1="96" x2={CX} y2="990" />
          <Dim x1={236} y1={112} x2={964} y2={112} label="72 000" />
          <Dim x1={196} y1={150} x2={196} y2={931} label="21 600" vertical />
          <Dim x1={831} y1={738} x2={368} y2={738} label="7 · 14 · 28" />
          <text className="hp-note" x="686" y="172">Ø 108</text>
          <text className="hp-note" x="244" y="954">x.598 / y.476</text>
          <text className="hp-note" x="924" y="954" textAnchor="end">ॐ · 1</text>

          {/* the bindu, crossed like a star sighting */}
          <g transform={`translate(${CX} 228)`} className="hp-star">
            <circle r="34" className="hp-star-ring" />
            <path d={star(30, 5)} />
            <circle r="5" className="hp-bindu" />
          </g>

          {/* the chakras, lit one after another up the spine */}
          {NODES.map((p, i) => (
            <g key={p.n} className={`hp-node hp-node-${i + 1}`} transform={`translate(${CX} ${p.y})`}>
              <circle r="9" /><circle r="2.6" className="hp-node-core" />
            </g>
          ))}

          <Callout x={CX + 12} y={228} tx={832} ty={150} text="06 · ajna → bindu.hold()" />
          <Callout x={632} y={480} tx={846} ty={404} text="04 · anahata → spanda .72" />
          <Callout x={CX - 12} y={846} tx={384} ty={1020} side="left" text="01 · muladhara → ground()" />

          <g className="hp-code">
            <text x="880" y="566">{'>>> SPANDA::INIT {'}</text>
            <text x="908" y="594">prakasha := still</text>
            <text x="908" y="622">vimarsha &lt;~ self</text>
            <text x="908" y="650">nada &gt;&gt; bindu</text>
            <text x="908" y="678">seeker ?= sought</text>
            <text x="880" y="706">{'}'}</text>
          </g>
        </svg>
        <span className="hp-scan" />
        <span className="hp-corner tl" /><span className="hp-corner tr" /><span className="hp-corner bl" /><span className="hp-corner br" />
      </div>
      <figcaption><span>Pl. 01 — The seated body, measured</span><span>Sattvagenic · field study</span></figcaption>
    </figure>
  );
}
