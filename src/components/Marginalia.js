import React from 'react';

/*
 * Marginalia — notes in the margins of the About folio, as a scholar might leave in a
 * manuscript: sightings crossed like stars, a measuring rule, a small node diagram and
 * glosses on a few words of the tradition. Desktop only; purely decorative.
 */
const star = 'M0,-14 L2.6,-2.6 L14,0 L2.6,2.6 L0,14 L-2.6,2.6 L-14,0 L-2.6,-2.6 Z';

function Sighting({ y, deva, roman, gloss, side }) {
  // A star sighting with a leader line running in towards the folio.
  const toward = side === 'left' ? 1 : -1, cx = side === 'left' ? 46 : 114;
  return (
    <g transform={`translate(0 ${y})`}>
      <circle className="mg-ring" cx={cx} cy="0" r="20" />
      <path className="mg-star" d={star} transform={`translate(${cx} 0)`} />
      <line className="mg-lead" x1={cx + 20 * toward} y1="0" x2={side === 'left' ? 160 : 0} y2="0" />
      <text className="mg-deva" x={cx} y="44" textAnchor="middle" lang="sa">{deva}</text>
      <text className="mg-gloss" x={cx} y="62" textAnchor="middle">{roman}</text>
      <text className="mg-gloss mg-faint" x={cx} y="76" textAnchor="middle">{gloss}</text>
    </g>
  );
}

function Rule({ x, y, h }) {
  const ticks = [];
  for (let i = 0; i <= h; i += 12) ticks.push(<line key={i} x1={x} y1={y + i} x2={x + (i % 60 ? 5 : 11)} y2={y + i} />);
  return <g className="mg-rule"><line x1={x} y1={y} x2={x} y2={y + h} />{ticks}</g>;
}

export default function Marginalia() {
  return (
    <>
      <svg className="about-marg about-marg-l" viewBox="0 0 160 980" aria-hidden="true">
        <Sighting y={70} side="left" deva="प्रकाश" roman="prakāśa" gloss="the light" />
        <Rule x={30} y={170} h={240} />
        <text className="mg-gloss mg-faint" x="48" y="408" transform="rotate(-90 48 408)">108 · 72 000 · 21 600</text>
        <Sighting y={470} side="left" deva="विमर्श" roman="vimarśa" gloss="its knowing" />
        <g className="mg-graph" transform="translate(30 620)">
          <polyline points="12,0 70,34 30,96 92,132" />
          <circle cx="12" cy="0" r="3" /><circle cx="70" cy="34" r="3" /><circle cx="30" cy="96" r="3" /><circle cx="92" cy="132" r="3" />
          <text x="18" y="-6">n.01</text><text x="76" y="30">n.02</text><text x="36" y="92">n.03</text><text x="98" y="128">n.04</text>
        </g>
        <text className="mg-gloss mg-faint" x="30" y="820">@sadhana {'{'}</text>
        <text className="mg-gloss mg-faint" x="44" y="836">breath ++</text>
        <text className="mg-gloss mg-faint" x="44" y="852">seeker ?= sought</text>
        <text className="mg-gloss mg-faint" x="30" y="868">{'}'}</text>
      </svg>

      <svg className="about-marg about-marg-r" viewBox="0 0 160 980" aria-hidden="true">
        <Sighting y={70} side="right" deva="स्पन्द" roman="spanda" gloss="the pulse" />
        <g className="mg-stamp" transform="translate(80 250)">
          <rect x="-46" y="-34" width="92" height="68" rx="9" />
          <text className="mg-deva" y="-4" textAnchor="middle" lang="sa">११२</text>
          <text className="mg-gloss" y="18" textAnchor="middle">dhāraṇā</text>
        </g>
        <Rule x={126} y={330} h={180} />
        <Sighting y={590} side="right" deva="प्रत्यभिज्ञा" roman="pratyabhijñā" gloss="recognition" />
        <g className="mg-graph" transform="translate(110 760)">
          <circle cx="0" cy="0" r="26" className="mg-ring-soft" /><circle cx="0" cy="0" r="14" className="mg-ring-soft" />
          <circle cx="0" cy="0" r="3" />
          <line x1="-40" y1="0" x2="-30" y2="0" /><line x1="30" y1="0" x2="40" y2="0" />
          <line x1="0" y1="-40" x2="0" y2="-30" /><line x1="0" y1="30" x2="0" y2="40" />
        </g>
        <text className="mg-gloss mg-faint" x="130" y="840" textAnchor="end">ॐ · ∞</text>
      </svg>
    </>
  );
}
