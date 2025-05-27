import React from 'react';
import pillar from './images/pillar.jpg';

const StoneColumns = () => {
  return (
    <div className="stone-columns">
      <div className="stone-column left">
        <div className="glyph-overlay" />
        <svg className="column-glyphs" viewBox="-68 -76 200 800" preserveAspectRatio="none">
          {/* Keep existing glyphs */}
          <g transform="translate(-9, 439) rotate(90, 50, 100)">
    <path 
        className="glyph glyph-1"
        d="M30 100 
            L50 80 L70 100 L70 120 L50 140 L30 120 Z
            M50 85 L50 135
            M35 110 L65 110
            M40 95 L60 125
            M40 125 L60 95"
    />
</g>
          
          <g className="glyph glyph-2" transform="translate(30, 210)">
            <circle r="25" />
            <path d="M-20-20 L20 20 M-20 20 L20-20" />
            <circle r="15" />
          </g>

          <g transform="translate(0, 800)">
            <path 
              className="glyph glyph-3 flow-line"
              d="M10 350 h20 l5 5 h30 l5 -5 h20"
            />
          </g>

          <g transform="translate(-10, 300)">
            <line 
              className="glyph glyph-5 power-line" 
              x1="50" y1="500" x2="50" y2="600"
            />
          </g>

          {/* Added rotated hex glyph */}
          <g transform="translate(-23, 530) rotate(90)">
            <path 
              className="glyph glyph-1"
              d="M30 100 
                 L50 80 L70 100 L70 120 L50 140 L30 120 Z
                 M50 85 L50 135
                 M35 110 L65 110
                 M40 95 L60 125
                 M40 125 L60 95"
            />
          </g>
        </svg>
      </div>

      <div className="stone-column right">
        <div className="glyph-overlay" />
        <svg className="column-glyphs" viewBox="-72 24 200 800" preserveAspectRatio="none">
          {/* Modified to add rotation */}
          <g transform="translate(-13, 540) rotate(90, 50, 100)">
            <path 
              className="glyph glyph-1"
              d="M30 100 
                 L50 80 L70 100 L70 120 L50 140 L30 120 Z
                 M50 85 L50 135
                 M35 110 L65 110
                 M40 95 L60 125
                 M40 125 L60 95"
            />
          </g>

          <g transform="translate(-23, -200)">
            <path 
              className="glyph glyph-2"
              d="M20 200 
                 C30 190, 70 190, 80 200
                 C90 210, 90 230, 80 240
                 C70 250, 30 250, 20 240
                 C10 230, 10 210, 20 200
                 M30 220 L70 220
                 M50 210 L50 230"
            />
          </g>

          <g className="glyph glyph-3" transform="translate(27, 313)">
            <circle r="20" className="tech-circle" />
            <path d="M-15-15 L15 15 M-15 15 L15-15" className="tech-x" />
            <circle r="10" className="tech-inner" />
            <path d="M0-20 L0 20 M-20 0 L20 0" className="tech-cross" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default StoneColumns;