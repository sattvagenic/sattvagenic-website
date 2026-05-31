import React from 'react';
import damaru from '../images/damaru.svg';

/*
 * HomeDecor — the Shaivo-futurist decoration layer for the homepage only.
 * Renders behind the page content (z-index 0): a faded worn damaru behind the
 * hero, sacred-circuit glyph spines + rails down the margins, corner symbol
 * tiles, and small datura stations. Plus eased riso grain + mottle overlays.
 *
 * The damaru is a standalone, self-contained SVG (src/images/damaru.svg) so it
 * can be swapped wholesale — e.g. an Illustrator export with the Sanskrit band.
 *
 * Everything here is purely decorative: aria-hidden + pointer-events:none.
 * Spines / rails / tiles hide at <=1080px (see App.css) so mobile stays clean.
 */
function HomeDecor() {
  return (
    <>
      {/* warm Nadi-page stone backdrop (the rest of the site uses the cooler
          grey stone; the homepage matches the Nadi page) */}
      <div className="sg-bg" aria-hidden="true" />
      {/* worn riso overlays — kept outside .sg-decor because a CSS transform
          on an ancestor would break their position:fixed full-viewport cover */}
      <div className="sg-mottle" aria-hidden="true" />
      <div className="sg-grain" aria-hidden="true" />
      <div className="sg-decor" aria-hidden="true">
      {/* shared defs: worn filter, halftone patterns, datura glyph */}
      <svg className="sg-decor-defs" width="0" height="0" focusable="false">
        <defs>
          <pattern id="sgHt" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="1.35" fill="#357a64" />
          </pattern>
          <pattern id="sgStipple" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#245c4e" />
          </pattern>
          <filter id="sgWornLine" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.7" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <g id="sgDatura">
            <path fill="url(#sgHt)" opacity="0.8" d="M0 0 C -14 -58 -58 -128 -90 -180 L -90 -182 Q -67 -158 -45 -186 Q -22 -158 0 -188 Q 22 -158 45 -186 Q 67 -158 90 -182 L 90 -180 C 58 -128 14 -58 0 0 Z" />
            <g stroke="#1f5a49" strokeWidth="1.1" fill="none" opacity="0.5">
              <path d="M0 -2 L -90 -181" /><path d="M0 -2 L -45 -185" /><path d="M0 -2 L 0 -187" />
              <path d="M0 -2 L 45 -185" /><path d="M0 -2 L 90 -181" /><path d="M-90 -180 Q 0 -150 90 -180" />
            </g>
          </g>
        </defs>
      </svg>

      {/* worn riso overlays (eased) */}
      {/* (rendered above as fragment siblings) */}

      {/* full-height rails */}
      <div className="sg-rail sg-rail-l" />
      <div className="sg-rail sg-rail-r" />

      {/* damaru behind the hero (swappable asset) */}
      <img className="sg-damaru" src={damaru} alt="" />

      {/* LEFT spine */}
      <div className="sg-spine sg-spine-l">
        <svg width="120" height="600" viewBox="0 0 120 600">
          <text className="gl-label" x="22" y="14">SV - 07</text>
          <circle className="gl-node" cx="60" cy="22" r="2.5" />
          <line className="gl-ln" x1="60" y1="22" x2="92" y2="22" /><line className="gl-ln" x1="92" y1="22" x2="92" y2="38" />
          <circle className="gl-node-accent" cx="92" cy="38" r="2" />
          <g transform="translate(60,90)">
            <polygon className="gl-ln" points="0,-30 26,15 -26,15" /><polygon className="gl-accent" points="0,30 26,-15 -26,-15" />
            <circle className="gl-soft" cx="0" cy="0" r="36" /><circle className="gl-soft" cx="0" cy="0" r="22" />
            <circle className="gl-node-accent" cx="0" cy="0" r="2.2" />
          </g>
          <g transform="translate(60,200) scale(0.2)"><use href="#sgDatura" /></g>
          <line className="gl-ln" x1="60" y1="232" x2="24" y2="232" /><circle className="gl-node" cx="24" cy="232" r="2" />
          <g transform="translate(60,300)">
            <circle className="gl-ln" cx="0" cy="0" r="28" />
            <g className="gl-ln"><line x1="-28" y1="0" x2="28" y2="0" /><line x1="0" y1="-28" x2="0" y2="28" />
              <line x1="-20" y1="-20" x2="20" y2="20" /><line x1="-20" y1="20" x2="20" y2="-20" /></g>
            <circle className="gl-ln" cx="0" cy="0" r="10" /><circle className="gl-node-accent" cx="0" cy="0" r="2.4" />
          </g>
          <text className="gl-label" x="22" y="400">CH - 02</text>
          <g transform="translate(60,500)">
            <circle className="gl-ln" cx="0" cy="0" r="22" /><polygon className="gl-ln" points="0,-18 16,9 -16,9" />
            <polygon className="gl-soft" points="0,18 16,-9 -16,-9" /><circle className="gl-node" cx="0" cy="0" r="1.6" />
          </g>
          <text className="gl-label" x="22" y="588">GND</text>
        </svg>
      </div>

      {/* RIGHT spine */}
      <div className="sg-spine sg-spine-r">
        <svg width="120" height="600" viewBox="0 0 120 600">
          <text className="gl-label" x="60" y="14" textAnchor="end">CH - FLOW</text>
          <circle className="gl-node-accent" cx="60" cy="22" r="2.5" />
          <line className="gl-ln" x1="60" y1="22" x2="28" y2="22" /><line className="gl-ln" x1="28" y1="22" x2="28" y2="44" />
          <g transform="translate(60,90)">
            <circle className="gl-ln" cx="0" cy="0" r="36" /><circle className="gl-soft" cx="0" cy="0" r="28" />
            <circle className="gl-ln" cx="0" cy="0" r="20" /><circle className="gl-soft" cx="0" cy="0" r="12" />
            <circle className="gl-node-accent" cx="0" cy="0" r="3" />
            <line className="gl-ln" x1="-40" y1="0" x2="-32" y2="0" /><line className="gl-ln" x1="40" y1="0" x2="32" y2="0" />
            <line className="gl-ln" x1="0" y1="-40" x2="0" y2="-32" /><line className="gl-ln" x1="0" y1="40" x2="0" y2="32" />
          </g>
          <line className="gl-ln" x1="60" y1="138" x2="60" y2="166" />
          <polyline className="gl-ln" points="60,166 50,170 70,176 50,182 70,188 60,192" />
          <line className="gl-ln" x1="60" y1="192" x2="60" y2="216" /><circle className="gl-node" cx="60" cy="216" r="2" />
          <g transform="translate(60,290)">
            <polygon className="gl-ln" points="0,-22 20,12 -20,12" /><polygon className="gl-soft" points="0,22 20,-12 -20,-12" />
            <circle className="gl-ln" cx="0" cy="0" r="28" /><circle className="gl-node-accent" cx="0" cy="0" r="1.8" />
          </g>
          <g transform="translate(60,420)">
            <rect className="gl-ln" x="-26" y="-26" width="52" height="52" /><rect className="gl-soft" x="-18" y="-18" width="36" height="36" />
            <polygon className="gl-accent" points="0,-22 22,0 0,22 -22,0" /><circle className="gl-node" cx="0" cy="0" r="2" />
          </g>
          <text className="gl-label" x="60" y="588" textAnchor="end">80 - 7</text>
        </svg>
      </div>
    </div>
    </>
  );
}

export default HomeDecor;
