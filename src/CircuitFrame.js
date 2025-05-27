import React from 'react';

const CircuitFrame = () => {
  return (
    <svg className="circuit-frame" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Corner Mandala Circuits */}
      <g className="corner-mandala">
        {/* Top Left Corner */}
        <g className="mandala-circuit" transform="translate(10, 10) scale(0.15)">
          <path className="mandala-path" d="M0,0 C50,20 50,-20 100,0 C80,50 120,50 100,100 C50,80 50,120 0,100 C20,50 -20,50 0,0 Z" />
          <circle className="circuit-node" cx="50" cy="50" r="5" />
          <path className="circuit-detail" d="M30,50 Q50,20 70,50 Q50,80 30,50" />
          <path className="circuit-detail" d="M50,30 Q80,50 50,70 Q20,50 50,30" />
          {/* Sanskrit-inspired glyph */}
          <path className="glyph-path" d="M40,40 Q50,30 60,40 Q70,50 60,60 Q50,70 40,60 Q30,50 40,40" />
        </g>
        
        {/* Other corners - rotated copies */}
        <use href="#corner-mandala" transform="translate(90, 10) rotate(90)" />
        <use href="#corner-mandala" transform="translate(90, 90) rotate(180)" />
        <use href="#corner-mandala" transform="translate(10, 90) rotate(270)" />
      </g>

      {/* Flowing Circuit Lines */}
      <g className="circuit-flows">
        {/* Top Edge */}
        <path className="flow-line" d="M20,5 C30,5 40,15 50,5 C60,15 70,5 80,5">
          <animate attributeName="stroke-dashoffset" from="0" to="20" dur="3s" repeatCount="indefinite" />
        </path>
        
        {/* Bottom Edge */}
        <path className="flow-line" d="M20,95 C30,95 40,85 50,95 C60,85 70,95 80,95">
          <animate attributeName="stroke-dashoffset" from="20" to="0" dur="3s" repeatCount="indefinite" />
        </path>

        {/* Side Edges with Sanskrit-inspired patterns */}
        <path className="sanskrit-circuit" d="M5,20 Q15,30 5,40 Q15,50 5,60 Q15,70 5,80">
          <animate attributeName="stroke-dashoffset" from="0" to="20" dur="4s" repeatCount="indefinite" />
        </path>
        <path className="sanskrit-circuit" d="M95,20 Q85,30 95,40 Q85,50 95,60 Q85,70 95,80">
          <animate attributeName="stroke-dashoffset" from="20" to="0" dur="4s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Decorative Glyphs */}
      <g className="tech-glyphs">
        <circle className="glyph-node" cx="50" cy="5" r="2">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle className="glyph-node" cx="50" cy="95" r="2">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
};

export default CircuitFrame;