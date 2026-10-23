import React from 'react';
import './HomeDecor.css';

/*
 * HomeDecor — the homepage's margins: down each side a sacred-circuit spine
 * with a column of the Shiva Sutras running beside it. (The patina ground,
 * grain and fonts are shared by every page, in SiteGround.)
 * Everything here is decorative: aria-hidden and pointer-events: none.
 * The margins hide below 1080px so phones stay calm.
 */

// Shiva Sutras 1.1–1.6, read down the two margins.
const SUTRAS_L = 'चैतन्यमात्मा ॥ १ ॥ ज्ञानं बन्धः ॥ २ ॥ योनिवर्गः कलाशरीरम् ॥ ३ ॥';
const SUTRAS_R = 'ज्ञानाधिष्ठानं मातृका ॥ ४ ॥ उद्यमो भैरवः ॥ ५ ॥ शक्तिचक्रसन्धाने विश्वसंहारः ॥ ६ ॥';

function HomeDecor() {
  return (
    <>
      <div className="sg-decor" aria-hidden="true">
        <svg className="sg-decor-defs" width="0" height="0" focusable="false">
          <defs>
            <pattern id="sgHt" width="5" height="5" patternUnits="userSpaceOnUse">
              <circle cx="2.5" cy="2.5" r="1.25" fill="#4fa58a" />
            </pattern>
            <filter id="sgWornLine" x="-15%" y="-15%" width="130%" height="130%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9 0.7" numOctaves="2" seed="4" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <g id="sgDatura">
              <path fill="url(#sgHt)" opacity="0.8" d="M0 0 C -14 -58 -58 -128 -90 -180 L -90 -182 Q -67 -158 -45 -186 Q -22 -158 0 -188 Q 22 -158 45 -186 Q 67 -158 90 -182 L 90 -180 C 58 -128 14 -58 0 0 Z" />
              <g stroke="#6fb79c" strokeWidth="1.1" fill="none" opacity="0.5">
                <path d="M0 -2 L -90 -181" /><path d="M0 -2 L -45 -185" /><path d="M0 -2 L 0 -187" />
                <path d="M0 -2 L 45 -185" /><path d="M0 -2 L 90 -181" /><path d="M-90 -180 Q 0 -150 90 -180" />
              </g>
            </g>
          </defs>
        </svg>

        <div className="sg-rail sg-rail-l" />
        <div className="sg-rail sg-rail-r" />

        {/* LEFT spine */}
        <div className="sg-spine sg-spine-l">
          <svg width="120" height="760" viewBox="0 0 120 760">
            <text className="gl-label" x="22" y="14">SV - 07</text>
            <circle className="gl-node" cx="60" cy="22" r="2.5" />
            <line className="gl-ln" x1="60" y1="22" x2="92" y2="22" /><line className="gl-ln" x1="92" y1="22" x2="92" y2="38" />
            <circle className="gl-term" cx="92" cy="41" r="3" />
            <g transform="translate(60,90)">
              <polygon className="gl-ln" points="0,-30 26,15 -26,15" /><polygon className="gl-accent" points="0,30 26,-15 -26,-15" />
              <circle className="gl-soft" cx="0" cy="0" r="36" /><circle className="gl-soft" cx="0" cy="0" r="22" />
              <circle className="gl-node-accent gl-pulse" cx="0" cy="0" r="2.2" />
            </g>
            <polyline className="gl-ln" points="60,126 60,150 40,170 40,196" /><circle className="gl-term" cx="40" cy="199" r="3" />
            <g transform="translate(64,262) scale(0.2)"><use href="#sgDatura" /></g>
            <line className="gl-ln" x1="64" y1="266" x2="24" y2="266" /><circle className="gl-node" cx="24" cy="266" r="2" />
            <g transform="translate(60,330)">
              <circle className="gl-ln" cx="0" cy="0" r="28" />
              <g className="gl-ln"><line x1="-28" y1="0" x2="28" y2="0" /><line x1="0" y1="-28" x2="0" y2="28" />
                <line x1="-20" y1="-20" x2="20" y2="20" /><line x1="-20" y1="20" x2="20" y2="-20" /></g>
              <circle className="gl-ln" cx="0" cy="0" r="10" /><circle className="gl-node-accent" cx="0" cy="0" r="2.4" />
            </g>
            <polyline className="gl-soft" points="60,358 60,420 84,444 84,470" /><circle className="gl-term" cx="84" cy="473" r="3" />
            <text className="gl-label" x="22" y="440">CH - 02</text>
            <g transform="translate(60,540)">
              <circle className="gl-ln" cx="0" cy="0" r="22" /><polygon className="gl-ln" points="0,-18 16,9 -16,9" />
              <polygon className="gl-soft" points="0,18 16,-9 -16,-9" /><circle className="gl-node" cx="0" cy="0" r="1.6" />
            </g>
            <polyline className="gl-ln" points="60,562 60,640 36,664 36,700" /><circle className="gl-term" cx="36" cy="703" r="3" />
            <text className="gl-label" x="22" y="748">GND</text>
          </svg>
          <p className="sg-sutra" lang="sa">{SUTRAS_L}</p>
        </div>

        {/* RIGHT spine */}
        <div className="sg-spine sg-spine-r">
          <svg width="120" height="760" viewBox="0 0 120 760">
            <text className="gl-label" x="60" y="14" textAnchor="end">CH - FLOW</text>
            <circle className="gl-node-accent" cx="60" cy="22" r="2.5" />
            <line className="gl-ln" x1="60" y1="22" x2="28" y2="22" /><line className="gl-ln" x1="28" y1="22" x2="28" y2="44" />
            <circle className="gl-term" cx="28" cy="47" r="3" />
            <g transform="translate(60,90)">
              <circle className="gl-ln" cx="0" cy="0" r="36" /><circle className="gl-soft" cx="0" cy="0" r="28" />
              <circle className="gl-ln" cx="0" cy="0" r="20" /><circle className="gl-soft" cx="0" cy="0" r="12" />
              <circle className="gl-node-accent gl-pulse" cx="0" cy="0" r="3" />
              <line className="gl-ln" x1="-40" y1="0" x2="-32" y2="0" /><line className="gl-ln" x1="40" y1="0" x2="32" y2="0" />
              <line className="gl-ln" x1="0" y1="-40" x2="0" y2="-32" /><line className="gl-ln" x1="0" y1="40" x2="0" y2="32" />
            </g>
            <line className="gl-ln" x1="60" y1="138" x2="60" y2="166" />
            <polyline className="gl-ln" points="60,166 50,170 70,176 50,182 70,188 60,192" />
            <line className="gl-ln" x1="60" y1="192" x2="60" y2="216" /><circle className="gl-node" cx="60" cy="216" r="2" />
            <polyline className="gl-soft" points="60,216 84,240 84,262" /><circle className="gl-term" cx="84" cy="265" r="3" />
            <g transform="translate(60,320)">
              <polygon className="gl-ln" points="0,-22 20,12 -20,12" /><polygon className="gl-soft" points="0,22 20,-12 -20,-12" />
              <circle className="gl-ln" cx="0" cy="0" r="28" /><circle className="gl-node-accent" cx="0" cy="0" r="1.8" />
            </g>
            <polyline className="gl-ln" points="60,348 60,400 36,424 36,450" /><circle className="gl-term" cx="36" cy="453" r="3" />
            <g transform="translate(60,520)">
              <rect className="gl-ln" x="-26" y="-26" width="52" height="52" /><rect className="gl-soft" x="-18" y="-18" width="36" height="36" />
              <polygon className="gl-accent" points="0,-22 22,0 0,22 -22,0" /><circle className="gl-node" cx="0" cy="0" r="2" />
            </g>
            <polyline className="gl-soft" points="60,546 60,640 84,664 84,700" /><circle className="gl-term" cx="84" cy="703" r="3" />
            <text className="gl-label" x="60" y="748" textAnchor="end">80 - 7</text>
          </svg>
          <p className="sg-sutra" lang="sa">{SUTRAS_R}</p>
        </div>
      </div>
    </>
  );
}

export default HomeDecor;
